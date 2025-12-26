import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Webhook proxy POST called")
  console.log("[v0] Request URL:", request.url)
  console.log("[v0] Request method:", request.method)

  try {
    const body = await request.formData()
    console.log("[v0] FormData received, forwarding to n8n...")

    const targetUrl = body.get("targetUrl") as string
    const webhookUrl = targetUrl || "https://n8n-webhook.rumsan.net/webhook/customer-support"

    // Remove targetUrl from formData before forwarding
    if (targetUrl) {
      body.delete("targetUrl")
    }

    console.log("[v0] Forwarding to URL:", webhookUrl)

    // Forward the request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: body,
    })

    console.log("[v0] n8n response status:", response.status)
    const responseText = await response.text()
    console.log("[v0] n8n response text:", responseText)

    // Return the response with proper CORS headers
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] Webhook proxy error:", error)
    return NextResponse.json({ error: "Failed to forward request" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
