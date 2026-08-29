import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Intro } from "@/components/sections/Intro";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";

export default function Home() {
  return (
    <main>
      <Intro />
      <Work />
      <Services />
      <About />
      <Contact />
    </main>
  );
}
