"use client";

import { useEffect } from "react";

export default function ActiveLinks() {
  useEffect(() => {
    function f() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          const selector = `nav.toc a[href="#${id}"]`;
          if (entry.intersectionRatio > 0) {
            if (document?.querySelector(selector)) {
              try {
                const thing = document.querySelector(".toc-active");

                if (thing) {
                  thing.classList.remove("toc-active");
                }
              } catch {}
              document.querySelector(selector)?.classList.add("toc-active");
            }
          }
        });
      });

      if (document) {
        // Track all sections that have an `id` applied
        document.querySelectorAll("h2[id]").forEach((section) => {
          observer.observe(section);
        });
      }
    }

    f();
  });

  return <div></div>;
}
