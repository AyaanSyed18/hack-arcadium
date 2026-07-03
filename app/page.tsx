import Hero from "@/components/hero";
import Timeline from "@/components/timeline";
import Faq from "@/components/faq";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      <Hero />
      <Timeline />
      <Faq />
      <Footer />
    </main>
  );
}