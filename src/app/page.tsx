
import { About }  from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Intro } from "@/components/sections/Intro";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";

export default function Home() {
  return (
    <main className="max-w-full overflow-x-hidden">
      <Intro />
      <Work />
      <div className="lg:h-[20svh]"></div>
      <Services />
      <div className="lg:h-[20svh]"></div>

      <About />
      <div className="lg:h-[25svh]"></div>
      <Contact />
    </main>
  );
}
