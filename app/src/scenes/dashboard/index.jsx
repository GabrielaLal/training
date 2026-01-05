import React, { useState } from "react"
import { Link } from "react-router-dom"
import { AiOutlineCalendar, AiOutlineUser } from "react-icons/ai"
import useStore from "@/services/store"

export default function Dashboard() {
  const { user } = useStore()
  const [showArchitecture, setShowArchitecture] = useState(false)
  const [showGitWorkflow, setShowGitWorkflow] = useState(false)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Week 1: Mastering the API</h1>
          <p className="text-sm text-gray-600 mt-1">Build your first full-stack module and master our architectural patterns</p>
        </div>
        <div className="text-xs text-gray-500">
          📚 README.md • <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">npm run seed</code>
        </div>
      </div>

      {/* Collapsible Architecture */}
      <div className="mb-6">
        <button
          onClick={() => setShowArchitecture(!showArchitecture)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>{showArchitecture ? "▼" : "▶"}</span>
          <span>Current API Architecture (reference)</span>
        </button>
        
        {showArchitecture && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4">
          {/* Controllers */}
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 font-semibold">controllers/</span>
              <span className="text-gray-500">HTTP endpoints</span>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>event.js</span>
                <span className="text-gray-600 ml-auto">POST /event/*</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>attendee.js</span>
                <span className="text-gray-600 ml-auto">POST /attendee/*</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>user.js</span>
                <span className="text-gray-600 ml-auto">POST /user/*</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <span className="text-gray-600">○</span>
                <span>webhook.js</span>
                <span className="text-gray-600 ml-auto">TO BUILD</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-gray-500 text-xs">
              Frontend → API (HTTP)
            </div>
          </div>

          {/* Services */}
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-purple-400 font-semibold">services/</span>
              <span className="text-gray-500">External APIs</span>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2 opacity-40">
                <span className="text-gray-600">○</span>
                <span>googleCalendar.js</span>
              </div>
              <div className="pl-6 text-gray-600 text-xs">
                Export events to Google
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-gray-500 text-xs">
              API → External (Google, Stripe...)
            </div>
          </div>

          {/* Crons */}
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-yellow-400 font-semibold">cron/</span>
              <span className="text-gray-500">Scheduled jobs</span>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2 opacity-40">
                <span className="text-gray-600">○</span>
                <span>eventReminders.js</span>
              </div>
              <div className="pl-6 text-gray-600 text-xs">
                Send reminders 24h before
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-gray-500 text-xs">
              Time-triggered (automatic)
            </div>
          </div>

          {/* Scripts */}
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-orange-400 font-semibold">scripts/</span>
              <span className="text-gray-500">Manual CLI</span>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>seed.js</span>
                <span className="text-gray-600 ml-auto text-xs">npm run seed</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <span className="text-gray-600">○</span>
                <span>cleanupBadEvents.js</span>
              </div>
              <div className="pl-6 text-gray-600 text-xs">
                Delete events with 'not-good'
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-gray-500 text-xs">
              Manual command (npm run)
            </div>
          </div>

          {/* Models */}
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs col-span-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400 font-semibold">models/</span>
              <span className="text-gray-500">MongoDB schemas</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-gray-300">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400">✓</span>
                  <span>user.js</span>
                </div>
                <div className="pl-6 text-gray-600 text-xs">name, email, password</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400">✓</span>
                  <span>event.js</span>
                </div>
                <div className="pl-6 text-gray-600 text-xs">title, dates, capacity</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400">✓</span>
                  <span>attendee.js</span>
                </div>
                <div className="pl-6 text-gray-600 text-xs">event_id, user_id, status</div>
              </div>
            </div>
          </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Git Workflow */}
      <div className="mb-6">
        <button
          onClick={() => setShowGitWorkflow(!showGitWorkflow)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>{showGitWorkflow ? "▼" : "▶"}</span>
          <span>Git Workflow & Pull Requests</span>
        </button>
        
        {showGitWorkflow && (
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔀</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">One PR per Feature</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">✅ DO:</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• <strong>Fork first</strong> - work on your own copy</li>
                      <li>• <strong>One feature = One PR</strong> (Venue, Calendar, Script...)</li>
                      <li>• <strong>Full-stack & working</strong> - Backend + Frontend, tested</li>
                      <li>• <strong>Self-contained</strong> - Each PR works independently</li>
                      <li>• <strong>Clear commits</strong> - <code className="bg-indigo-100 px-1 rounded">feat: add venue module</code></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">❌ DON'T:</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Don't submit giant PRs with multiple features</li>
                      <li>• Don't submit incomplete features (only backend)</li>
                      <li>• Don't submit broken code or linter errors</li>
                      <li>• Don't mix unrelated changes in one PR</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <strong>Example:</strong> PR #1 = Venue (model + controller + pages), PR #2 = Calendar Service, PR #3 = Cleanup Script
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-600">
                  <code className="bg-gray-800 text-green-400 px-2 py-1 rounded font-mono">git checkout -b feature/venue-module</code>
                  <span>→</span>
                  <code className="bg-gray-800 text-green-400 px-2 py-1 rounded font-mono">git push origin feature/venue-module</code>
                  <span>→</span>
                  <span className="text-indigo-600 font-semibold">Create PR from your fork</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Week 1 Tasks */}
      <div className="max-w-5xl">
        <div className="space-y-6">
          {/* DAY 1: Study & Setup */}
          <TaskCard
            day="DAY 1"
            title="Study: Event Module (Full Stack)"
            duration="4-6 hours"
            icon="📖"
            what="Understand how a complete CRUD module works"
            why="This is your blueprint - you'll copy this pattern for Venue"
            tasks={[
              {
                label: "Read Backend",
                files: ["api/src/models/event.js", "api/src/controllers/event.js"],
                notes: "Focus on 📚 comments - they explain WHY",
              },
              {
                label: "Read Frontend",
                files: ["app/src/scenes/events/list.jsx", "app/src/scenes/events/view/*"],
                notes: "See how frontend calls backend endpoints",
              },
              {
                label: "Test Features",
                notes: "Create event, edit, delete, search - understand the flow",
              },
            ]}
            resources={[
              { label: "Mongoose Docs", url: "https://mongoosejs.com/docs/guide.html" },
              { label: "Express Routing", url: "https://expressjs.com/en/guide/routing.html" },
              { label: "POST /search pattern", note: "See event.js line 27-40" },
            ]}
            deliverable="Can explain: Why POST for search? What's pagination? Why denormalize organizer?"
          />

          {/* DAY 2-3: Build Venue Module */}
          <TaskCard
            day="DAY 2-3"
            title="Build: Venue Module (Full Stack)"
            duration="12-16 hours"
            icon="🏢"
            what="Create a complete CRUD module from scratch"
            why="Prove you understand the pattern by replicating it"
            tasks={[
              {
                label: "Backend (Day 2 morning)",
                files: ["api/src/models/venue.js", "api/src/controllers/venue.js"],
                notes: "Fields: name, address, city, capacity, amenities, image_url, owner_id",
              },
              {
                label: "Register Route",
                files: ["api/src/index.js"],
                notes: 'Add: app.use("/venue", require("./controllers/venue"))',
              },
              {
                label: "Frontend (Day 2 afternoon + Day 3)",
                files: ["app/src/scenes/venues/index.jsx", "app/src/scenes/venues/list.jsx", "app/src/scenes/venues/view/*"],
                notes: "Copy Event pages structure (index, list, view tabs), adapt for Venue fields",
              },
              {
                label: "Test Everything",
                notes: "Create, search, update, delete venues - all should work",
              },
            ]}
            resources={[
              { label: "Reference", note: "Copy Event module 1:1, change field names" },
              { label: "Security", note: "Remember: owner_id from req.user, not req.body!" },
              { label: "Routes", note: "POST /venue/search, POST /venue/my-venues/search, etc." },
            ]}
            deliverable="Working Venue module with CRUD + search. Can create PR with clear commit messages."
          />

          {/* DAY 4: Services & Webhooks */}
          <TaskCard
            day="DAY 4"
            title="Build: Google Calendar Integration"
            duration="6-8 hours"
            icon="🔌"
            what="Service (export) + Webhook (receive updates)"
            why="Learn the difference: Service = we call them, Webhook = they call us"
            tasks={[
              {
                label: "Service",
                files: ["api/src/services/googleCalendar.js"],
                notes: "Function: exportEvent(eventId) → posts to Google Calendar API",
              },
              {
                label: "Webhook",
                files: ["api/src/controllers/webhook.js"],
                notes: "POST /webhook/calendar-sync → receives updates from Google",
              },
              {
                label: "Call Service from Controller",
                notes: "In event.js, call googleCalendar.exportEvent() after event creation",
              },
            ]}
            resources={[
              { label: "Google Calendar API", url: "https://developers.google.com/calendar/api/v3/reference" },
              { label: "Webhooks Explained", url: "https://www.svix.com/resources/guides/what-is-a-webhook/" },
              { label: "Key Difference", note: "Service = YOU call API. Webhook = API calls YOU." },
            ]}
            deliverable="Can explain: When to use Service vs Webhook? How does Google notify us of changes?"
          />

          {/* DAY 5: Cron & Script */}
          <TaskCard
            day="DAY 5"
            title="Build: Cron Job + Cleanup Script"
            duration="4-6 hours"
            icon="⏰"
            what="Scheduled task (cron) + Manual script"
            why="Learn when code runs automatically vs manually"
            tasks={[
              {
                label: "Cron Job",
                files: ["api/src/cron/eventReminders.js"],
                notes: "Runs every hour, finds events starting in 24h, sends emails",
              },
              {
                label: "Setup Cron",
                files: ["api/src/index.js"],
                notes: "Register cron: require('./cron/eventReminders').start()",
              },
              {
                label: "Cleanup Script",
                files: ["api/src/scripts/cleanupBadEvents.js"],
                notes: "Finds & deletes events with 'not-good' in title (run seed to see test data)",
              },
              {
                label: "Add npm script",
                files: ["api/package.json"],
                notes: '"cleanup": "node ./src/scripts/cleanupBadEvents.js"',
              },
            ]}
            resources={[
              { label: "node-cron", url: "https://www.npmjs.com/package/node-cron" },
              { label: "Test Data", note: "Seed creates 3 events with 'not-good' in title" },
              { label: "Key Difference", note: "Cron = automatic (time-based). Script = manual (npm run)." },
            ]}
            deliverable="Cron runs automatically. Script runs on command. Can explain when to use each."
          />

          {/* Gatekeeper */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚪</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Week 1 Gatekeeper: The "WHY" Check</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Before moving to Week 2, you must be able to explain (without looking at code):
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">1.</span>
                    <span><strong>POST vs GET for search:</strong> Why do we use POST /event/search instead of GET?</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">2.</span>
                    <span><strong>Service vs Webhook:</strong> When do you create a Service file vs a Webhook endpoint?</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">3.</span>
                    <span><strong>Cron vs Script:</strong> When do you use a Cron job vs a manual Script?</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">4.</span>
                    <span><strong>Security:</strong> Why do we set organizer_id from req.user instead of req.body?</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">5.</span>
                    <span><strong>Denormalization:</strong> Why store organizer_name in Event model instead of just organizer_id?</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-xs text-gray-600">
                    💡 <strong>Hint:</strong> All answers are in the 📚 comments in event.js. Understanding WHY > memorizing HOW.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ day, title, duration, icon, what, why, tasks, resources, deliverable }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{day}</span>
              <span className="text-xs text-gray-500">~{duration}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>
      </div>

      {/* What & Why */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-1">💡 WHAT</div>
          <div className="text-sm text-gray-600">{what}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-1">🎯 WHY</div>
          <div className="text-sm text-gray-600">{why}</div>
        </div>
      </div>

      {/* Tasks */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-900 mb-2">✅ TODO:</div>
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 mt-0.5"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{task.label}</div>
                {task.files && (
                  <div className="mt-1 space-y-1">
                    {task.files.map((file, i) => (
                      <code key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700 block w-fit">
                        {file}
                      </code>
                    ))}
                  </div>
                )}
                {task.notes && <div className="text-xs text-gray-600 mt-1">{task.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      {resources && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-semibold text-blue-900 mb-2">📚 RESOURCES:</div>
          <div className="space-y-1">
            {resources.map((resource, idx) => (
              <div key={idx} className="text-xs">
                {resource.url ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    → {resource.label}
                  </a>
                ) : (
                  <span className="text-gray-700">
                    → <strong>{resource.label}:</strong> {resource.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliverable */}
      <div className="pt-3 border-t border-gray-200">
        <div className="text-xs font-semibold text-green-700 mb-1">🎓 DELIVERABLE:</div>
        <div className="text-sm text-gray-700">{deliverable}</div>
      </div>
    </div>
  )
}

