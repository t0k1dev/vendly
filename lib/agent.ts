import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/prisma"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type RunAgentParams = {
  storeId: string
  clientPhone: string
  message: string
}

const FALLBACK = "Disculpa, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?"

// ─── Tool definitions ─────────────────────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: "buscar_producto",
    description: "Busca productos en el inventario de la tienda por nombre.",
    input_schema: {
      type: "object" as const,
      properties: { nombre: { type: "string", description: "Nombre o parte del nombre del producto" } },
      required: ["nombre"],
    },
  },
  {
    name: "consultar_stock",
    description: "Consulta el stock actual de un producto.",
    input_schema: {
      type: "object" as const,
      properties: { productoId: { type: "string", description: "ID del producto" } },
      required: ["productoId"],
    },
  },
  {
    name: "crear_pedido",
    description: "Crea un pedido para un cliente.",
    input_schema: {
      type: "object" as const,
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              productoId: { type: "string" },
              cantidad: { type: "number" },
            },
            required: ["productoId", "cantidad"],
          },
        },
        clientePhone: { type: "string", description: "Teléfono del cliente" },
      },
      required: ["items", "clientePhone"],
    },
  },
  {
    name: "registrar_cliente",
    description: "Registra o actualiza el nombre de un cliente.",
    input_schema: {
      type: "object" as const,
      properties: {
        nombre: { type: "string" },
        telefono: { type: "string" },
      },
      required: ["nombre", "telefono"],
    },
  },
  {
    name: "consultar_pedido",
    description: "Consulta el estado de un pedido por su ID.",
    input_schema: {
      type: "object" as const,
      properties: { pedidoId: { type: "string" } },
      required: ["pedidoId"],
    },
  },
]

// ─── Tool execution ───────────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>, storeId: string): Promise<string> {
  try {
    if (name === "buscar_producto") {
      const nombre = input.nombre as string
      const inventory = await prisma.inventory.findFirst({ where: { storeId } })
      if (!inventory) return "No se encontró inventario para esta tienda."
      const products = await prisma.product.findMany({
        where: { inventoryId: inventory.id, name: { contains: nombre, mode: "insensitive" } },
        take: 5,
      })
      if (!products.length) return `No se encontraron productos con el nombre "${nombre}".`
      return products
        .map((p) => `- ${p.name} | Precio: ${p.currency} ${p.price} | Stock: ${p.stock} | ID: ${p.id}`)
        .join("\n")
    }

    if (name === "consultar_stock") {
      const product = await prisma.product.findUnique({ where: { id: input.productoId as string } })
      if (!product) return "Producto no encontrado."
      return `${product.name}: ${product.stock} unidades disponibles.`
    }

    if (name === "crear_pedido") {
      const items = input.items as Array<{ productoId: string; cantidad: number }>
      const clientePhone = input.clientePhone as string

      // Verify client belongs to store
      const client = await prisma.client.findUnique({
        where: { storeId_phone: { storeId, phone: clientePhone } },
      })
      if (!client) return "Cliente no encontrado."

      // Check stock and compute total
      let total = 0
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productoId } })
        if (!product) return `Producto con ID ${item.productoId} no encontrado.`
        if (product.stock < item.cantidad) {
          return `Stock insuficiente para "${product.name}". Solo hay ${product.stock} unidades disponibles.`
        }
        total += Number(product.price) * item.cantidad
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          storeId,
          clientId: client.id,
          total,
          items: {
            create: await Promise.all(
              items.map(async (item) => {
                const product = await prisma.product.findUnique({ where: { id: item.productoId } })
                return { productId: item.productoId, quantity: item.cantidad, unitPrice: product!.price }
              })
            ),
          },
        },
      })

      // Decrement stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        })
      }

      return `Pedido creado exitosamente. ID: ${order.id}. Total: ${total.toFixed(2)}.`
    }

    if (name === "registrar_cliente") {
      const client = await prisma.client.upsert({
        where: { storeId_phone: { storeId, phone: input.telefono as string } },
        create: { storeId, phone: input.telefono as string, name: input.nombre as string },
        update: { name: input.nombre as string },
      })
      return `Cliente "${client.name}" registrado correctamente.`
    }

    if (name === "consultar_pedido") {
      const order = await prisma.order.findUnique({
        where: { id: input.pedidoId as string },
        include: { items: { include: { product: true } } },
      })
      if (!order || order.storeId !== storeId) return "Pedido no encontrado."
      const itemsText = order.items
        .map((i) => `${i.product.name} x${i.quantity}`)
        .join(", ")
      return `Pedido ${order.id}: ${order.status} | Items: ${itemsText} | Total: ${order.total}`
    }

    return "Herramienta desconocida."
  } catch (err) {
    console.error(`[agent] tool ${name} error:`, err)
    return "Ocurrió un error al ejecutar esta operación."
  }
}

// ─── Main agent runner ────────────────────────────────────────────────────────

export async function runAgent({ storeId, clientPhone, message }: RunAgentParams): Promise<string> {
  try {
    // Load agent config for system prompt
    const agentConfig = await prisma.agentConfig.findUnique({ where: { storeId } })
    const store = await prisma.store.findUnique({ where: { id: storeId } })

    const systemPrompt = `Eres el asistente virtual de WhatsApp de la tienda "${store?.name ?? "esta tienda"}".
Tu saludo de bienvenida es: "${agentConfig?.salutation ?? "¡Hola! ¿En qué te puedo ayudar?"}"
Tu tono es ${agentConfig?.tone === "FORMAL" ? "formal y profesional" : "amigable e informal"}.
Responde SIEMPRE en español. Sé conciso y útil.
Puedes buscar productos, consultar stock, crear pedidos, registrar clientes y consultar pedidos usando las herramientas disponibles.
Si un producto no tiene stock, informa al cliente amablemente y no crees el pedido.`

    // Load last 10 messages as history
    const history = await prisma.message.findMany({
      where: { storeId, clientPhone },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
    history.reverse()

    const historyMessages: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.direction === "IN" ? "user" : "assistant",
      content: m.content,
    }))

    const messages: Anthropic.MessageParam[] = [
      ...historyMessages,
      { role: "user", content: message },
    ]

    // Agentic loop
    let response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    })

    while (response.stop_reason === "tool_use") {
      const assistantMsg: Anthropic.MessageParam = { role: "assistant", content: response.content }
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type === "tool_use") {
          const result = await executeTool(block.name, block.input as Record<string, unknown>, storeId)
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result })
        }
      }

      messages.push(assistantMsg, { role: "user", content: toolResults })

      response = await anthropic.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages,
      })
    }

    // Extract text reply
    const textBlock = response.content.find((b) => b.type === "text")
    return textBlock && textBlock.type === "text" ? textBlock.text : FALLBACK
  } catch (err) {
    console.error("[agent] error:", err)
    return FALLBACK
  }
}
