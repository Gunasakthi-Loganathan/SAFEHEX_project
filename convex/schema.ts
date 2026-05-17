import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  scans: defineTable({
    userId: v.id("users"),
    target: v.string(),

    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),

    results: v.optional(
      v.array(
        v.object({
          title: v.string(),
          category: v.string(),
          source: v.string(),
          evidence: v.string(),

          port: v.optional(v.number()),
          protocol: v.optional(v.string()),
          service: v.optional(v.string()),
          banner: v.optional(v.string()),

          cvssScore: v.number(),

          riskLevel: v.union(
            v.literal("Info"),
            v.literal("Low"),
            v.literal("Medium"),
            v.literal("High"),
            v.literal("Critical")
          ),

          classification: v.union(
            v.literal("Safe"),
            v.literal("Possibly Vulnerable"),
            v.literal("Vulnerable")
          ),

          vulnerabilities: v.array(v.string()),
          explanation: v.string(),
          mitigation: v.string(),
          confidence: v.number(),
        })
      )
    ),

    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});