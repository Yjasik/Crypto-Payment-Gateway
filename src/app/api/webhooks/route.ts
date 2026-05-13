import { NextRequest, NextResponse } from 'next/server'

// Webhook event types
type WebhookEventType =
  | 'payment.received'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'payout.processed'
  | 'payout.failed'
  | 'product.created'
  | 'product.updated'
  | 'merchant.registered'
  | 'refund.processed'

// Webhook payload
interface WebhookPayload {
  event: WebhookEventType
  timestamp: string
  data: Record<string, unknown>
  signature?: string
}

// In-memory store for webhook logs (replace with database in production)
const webhookLogs: Array<{
  id: string
  event: WebhookEventType
  payload: WebhookPayload
  status: 'success' | 'failed'
  merchantUrl?: string
  error?: string
  receivedAt: string
}> = []

// Merchant webhook URLs (replace with database)
const merchantWebhooks: Record<string, string> = {
  merchant_001: 'https://merchant1.example.com/webhooks/crypto',
  merchant_002: 'https://merchant2.example.com/webhooks/crypto',
}

// Verify webhook signature
function verifySignature(payload: WebhookPayload, secret: string): boolean {
  if (!payload.signature) return false

  // Mock verification — replace with real HMAC check
  const expectedSignature = `sha256=${Buffer.from(
    JSON.stringify(payload.data) + secret
  )
    .toString('base64')
    .slice(0, 32)}`

  return payload.signature === expectedSignature
}

// Send webhook to merchant
async function sendMerchantWebhook(
  url: string,
  payload: WebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': payload.signature || '',
        'X-Webhook-Event': payload.event,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Merchant server responded with ${response.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// POST /api/webhooks — Receive webhook events
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate webhook payload
    if (!body.event || !body.data) {
      return NextResponse.json(
        { error: 'Invalid webhook payload. "event" and "data" are required.' },
        { status: 400 }
      )
    }

    const payload: WebhookPayload = {
      event: body.event as WebhookEventType,
      timestamp: body.timestamp || new Date().toISOString(),
      data: body.data,
      signature: body.signature,
    }

    // Verify signature if secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret && !verifySignature(payload, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Generate webhook ID
    const webhookId = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Process event
    let merchantNotificationStatus: 'success' | 'failed' = 'success'
    let merchantError: string | undefined

    // Extract merchant ID from data
    const merchantId = payload.data.merchantId as string | undefined

    // Send to merchant webhook URL if available
    if (merchantId && merchantWebhooks[merchantId]) {
      const merchantUrl = merchantWebhooks[merchantId]
      const result = await sendMerchantWebhook(merchantUrl, payload)

      merchantNotificationStatus = result.success ? 'success' : 'failed'
      merchantError = result.error
    }

    // Log webhook
    const logEntry = {
      id: webhookId,
      event: payload.event,
      payload,
      status: merchantNotificationStatus,
      merchantUrl: merchantId ? merchantWebhooks[merchantId] : undefined,
      error: merchantError,
      receivedAt: new Date().toISOString(),
    }

    webhookLogs.unshift(logEntry)

    // Keep only last 100 logs
    if (webhookLogs.length > 100) {
      webhookLogs.pop()
    }

    // Handle specific events
    switch (payload.event) {
      case 'payment.received':
        console.log(`[Webhook] Payment received:`, payload.data)
        break

      case 'payment.confirmed':
        console.log(`[Webhook] Payment confirmed:`, payload.data)
        break

      case 'payment.failed':
        console.log(`[Webhook] Payment failed:`, payload.data)
        break

      case 'payout.processed':
        console.log(`[Webhook] Payout processed:`, payload.data)
        break

      case 'refund.processed':
        console.log(`[Webhook] Refund processed:`, payload.data)
        break

      default:
        console.log(`[Webhook] Event received: ${payload.event}`)
    }

    return NextResponse.json({
      id: webhookId,
      status: 'received',
      merchantNotified: merchantNotificationStatus === 'success',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET /api/webhooks — List recent webhook logs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const event = searchParams.get('event')

  // Filter logs
  let filteredLogs = [...webhookLogs]

  if (event) {
    filteredLogs = filteredLogs.filter((log) => log.event === event)
  }

  // Paginate
  const paginatedLogs = filteredLogs.slice(0, Math.min(limit, 100))

  return NextResponse.json({
    total: filteredLogs.length,
    limit,
    logs: paginatedLogs.map((log) => ({
      id: log.id,
      event: log.event,
      status: log.status,
      merchantUrl: log.merchantUrl,
      error: log.error,
      receivedAt: log.receivedAt,
      // Don't expose full payload in list
      summary: {
        amount: log.payload.data.amount,
        token: log.payload.data.token,
        txHash: log.payload.data.txHash,
      },
    })),
  })
}

// PUT /api/webhooks — Register/update merchant webhook URL
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.merchantId || !body.webhookUrl) {
      return NextResponse.json(
        { error: 'merchantId and webhookUrl are required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(body.webhookUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      )
    }

    // Store webhook URL
    merchantWebhooks[body.merchantId] = body.webhookUrl

    // Send test webhook
    const testPayload: WebhookPayload = {
      event: 'payment.received',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'Webhook configured successfully',
      },
    }

    const result = await sendMerchantWebhook(body.webhookUrl, testPayload)

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? 'Webhook URL registered and test sent successfully'
        : `Webhook URL registered but test failed: ${result.error}`,
      merchantId: body.merchantId,
      webhookUrl: body.webhookUrl,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/webhooks — Remove merchant webhook
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      )
    }

    delete merchantWebhooks[body.merchantId]

    return NextResponse.json({
      success: true,
      message: 'Webhook removed',
      merchantId: body.merchantId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}