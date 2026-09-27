import { palette, space } from "@/lib/tokens";

export default function Loading() {
  return (
    <main className={palette.canvas}>
      <section className={space.containerLg + " animate-pulse py-10"}>
        <div className={`h-24 rounded-2xl ${palette.inkSoft}`} />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className={`h-48 rounded-2xl ${palette.inkSoft}`} />
          <div className={`h-48 rounded-2xl ${palette.inkSoft}`} />
        </div>
      </section>
    </main>
  );
}