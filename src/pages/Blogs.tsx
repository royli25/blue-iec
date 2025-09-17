import { useState } from "react";

interface Article {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  body: string;
}

const sample: Article[] = [
  {
    id: "25-07-31",
    date: "25-07-31",
    title: "Project 3 Agency",
    excerpt: "A behind-the-scenes of our latest agency experiment.",
    body:
      "Project 3 is an exploration into faster creative cycles. We outline process, tooling, and our approach to momentum.",
  },
  {
    id: "25-05-29",
    date: "25-05-29",
    title: "Dave Free for Bottega Veneta.",
    excerpt: "Notes on taste, restraint, and direction.",
    body:
      "We examine the collaboration and what it means for brand building in a noisy era.",
  },
  {
    id: "24-09-08",
    date: "24-09-08",
    title: "Super Bowl LIX. New Orleans. February 2025.",
    excerpt: "Plans, logistics, and a few early concepts.",
    body:
      "From early storyboards to live production, here’s how the team is preparing.",
  },
  {
    id: "24-07-04",
    date: "24-07-04",
    title: "Not Like Us. Directed by Dave Free & Kendrick Lamar.",
    excerpt: "A few production notes.",
    body:
      "Camera packages, lighting design, and the choreography rhythm that drove the shoot.",
  },
];

const Blogs = () => {
  const [active, setActive] = useState<Article>(sample[0]);

  return (
    <div className="h-screen bg-background relative">
      {/* Split: Left list, right article */}
      <div className="flex h-full w-full">
        {/* Left: list styled like reference */}
        <div className="w-1/2 h-full overflow-y-auto">
          <div className="px-8 sm:px-12 md:px-20 lg:px-28 py-10">
            <ul className="divide-y divide-border/60">
              {sample.map((a) => (
                <li key={a.id} className="py-4">
                  <button
                    onClick={() => setActive(a)}
                    className="group grid grid-cols-[96px_1fr] items-baseline gap-6 w-full text-left hover:opacity-100"
                  >
                    <span className="text-xs text-muted-foreground tracking-wide">{a.date}</span>
                    <div>
                      <div className="text-sm sm:text-base md:text-[17px] font-medium text-foreground group-hover:underline">
                        {a.title}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-border" />

        {/* Right: content */}
        <div className="w-1/2 h-full overflow-y-auto">
          <div className="px-8 sm:px-12 md:px-16 lg:px-20 py-10 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{active.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{active.date}</p>
            <div className="mt-6 space-y-4 text-[15px] leading-8 text-foreground/90">
              <p>{active.body}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus a
                urna quis dui molestie commodo. Integer commodo, lectus quis
                gravida facilisis, purus dolor dignissim orci, nec placerat est
                augue eget mauris.
              </p>
              <p>
                Cras ultricies, lacus ut pulvinar mattis, dolor ex vulputate neque,
                eu tincidunt neque odio quis elit. Donec non facilisis lacus. Nunc
                fermentum ante a ante efficitur, a tristique ipsum efficitur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
