import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listMyReviewsTool from "./tools/list-my-reviews";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "wolfrik-mcp",
  title: "WOLFRIK CO.",
  version: "0.1.0",
  instructions:
    "Tools for WOLFRIK CO. members. Use `get_profile` to read the signed-in user's profile, and `list_my_reviews` to list product reviews they've posted.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listMyReviewsTool],
});
