import { registerHooks } from "node:module";

// `next/server` resolves through Next.js's bundler, not through Node's bare
// specifier algorithm (the package ships no exports map). Node --test therefore
// cannot find it. Point the bare specifier at the file that actually exists and
// exports the same names (NextRequest, NextResponse, ...).
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }
    return nextResolve(specifier, context);
  },
});