import React from "react"
import { HiLockClosed } from "react-icons/hi"

export default function PaymentsTab({ eventId }) {
  return (
    <div>
      {/* Week 2 Lock Message */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <HiLockClosed className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-900 mb-2">🔒 Week 2+ Feature: Stripe Webhooks</h3>
            <div className="text-sm text-purple-800 space-y-3">
              <div>
                <p>
                  <strong>What you'll learn:</strong> How webhooks work with external services (Stripe)
                </p>
              </div>
              <div>
                <p>
                  <strong>Backend Webhook:</strong>
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-1">
                  <li>
                    Create <code className="bg-purple-100 px-1 rounded">POST /webhook/stripe</code> endpoint
                  </li>
                  <li>Verify Stripe signature for security</li>
                  <li>
                    Handle <code className="bg-purple-100 px-1 rounded">payment_intent.succeeded</code> event
                  </li>
                  <li>Update attendee payment status: pending → confirmed</li>
                </ul>
              </div>
              <div>
                <p>
                  <strong>Frontend Display:</strong>
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-1">
                  <li>Show payment summary (total revenue, confirmed vs pending)</li>
                  <li>List attendees with payment status</li>
                  <li>Display real-time webhook updates</li>
                </ul>
              </div>
              <div>
                <p>
                  <strong>Testing:</strong>
                </p>
                <ul className="list-disc ml-5 space-y-1 mt-1">
                  <li>Use Stripe test mode + Stripe CLI</li>
                  <li>
                    Command: <code className="bg-purple-100 px-1 rounded">stripe listen --forward-to localhost:8080/webhook/stripe</code>
                  </li>
                </ul>
              </div>
              <p className="mt-3">
                <strong>Week 1 Focus:</strong> Master Controllers, Services, and basic CRUD first!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Integration Coming Soon</h3>
        <p className="text-sm text-gray-600">You'll implement Stripe webhooks in Week 2</p>
      </div>
    </div>
  )
}
