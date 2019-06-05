(function () {
    "use strict";

    const svg_ns = "http://www.w3.org/2000/svg";
    const svg = document.getElementById("body");

    let tooltip;

    // Load the json containing body part description & their position on body.png
    function load_json() {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.responseType = "json";
            xhr.onload = () => {
                resolve(xhr.response);
            }
            xhr.open("GET", "human-body.json");
            xhr.send();
        })
    }

    // Loop to asign dom element's attributes more conveniently
    function assign_attributes(el, attr) {
        for (let [name, value] of Object.entries(attr)) {
            el.setAttribute(name, value);
        }
    }

    // Create the circle corresponding to the body parts
    function create_circle(x, y, r) {
        const circle = svg.appendChild(document.createElementNS(svg_ns, "circle"));
        assign_attributes(circle, {
            cx: x,
            cy: y,
            r: r
        });
        return circle;
    }

    // Remove all "active" classes from the circles
    function remove_active_class() {
        for (let el of svg.querySelectorAll(".active")) {
            el.classList.remove("active");
        }
    }

    // Create the bottom triangle of the tooltip
    function create_triangle(tooltip, tooltip_w, tooltip_h) {
        const w = 15, h = 10;
        // Place it at center horizontaly, and bottom of the tooltip
        const x = (tooltip_w - w) / 2, y = tooltip_h;

        const triangle = tooltip.appendChild(document.createElementNS(svg_ns, "path"));

        triangle.setAttribute("d", `m ${x} ${y} l ${w / 2} ${h} l ${w / 2} -${h} z`);

        return triangle;
    }

    // Create a tooltip when a circle is clicked indicating the body part's name
    function create_tooltip(w, h) {
        const tooltip = svg.appendChild(document.createElementNS(svg_ns, "g"));
        const rect = tooltip.appendChild(document.createElementNS(svg_ns, "rect"));
        const text = tooltip.appendChild(document.createElementNS(svg_ns, "text"));

        create_triangle(tooltip, w, h);

        tooltip.classList.add("tooltip");

        assign_attributes(rect, {
            x: 0,
            y: 0,
            width: w,
            height: h,
            rx: 5,
            ry: 5
        });

        assign_attributes(text, {
            x: w / 2,
            y: h / 2 + 5
        });

        return tooltip;
    }

    function set_tooltip(value, x, y) {
        const w = 100, h = 25;

        if (tooltip) {
            // Animate & remove the old tooltip
            const old = tooltip;
            TweenLite.to(old, 0.3, {
                opacity: 0,
                y: "-=50px",
                ease: Power1.easeIn,
                onComplete: () => old.remove()
            });

        }
        tooltip = create_tooltip(w, h);

        // Center the tooltip arround the given x position
        // Put it above the given y position
        x -= w / 2;
        y -= h + 5; // Add +5 to height for the bottom triangle

        // Animate the tooltip from opacity 0 to 1 in 0.2s
        TweenLite.from(tooltip, 0.2, {
            opacity: 0
        })

        // Animate its position veritically
        TweenLite.fromTo(
            tooltip, 0.5,
            {
                x: x,
                y: y + 10,
                ease: Power2.easeOut
            },
            {
                y: y
            }
        )

        // Assign its value with the given value
        let text = tooltip.querySelector("text");
        text.innerHTML = value;
    }

    // Set the body part's description & animate it
    function set_description(text) {
        const desc = document.getElementById("description");

        if (desc.innerText) {
            // If text is already present, animate using the flipping library
            const flipping = new Flipping();
            flipping.read();
            desc.innerText = text;
            flipping.flip();
        } else {
            // Otherwise animate it with gsap
            // Animate the svg#body with the flipping library
            const tl = new TimelineLite();
            const flipping = new Flipping();

            flipping.read();

            tl.set(desc, {
                transformOrigin: "left"
            });

            tl.set(desc, {
                text: text,
                scaleX: 0
            });

            tl.call(() => flipping.flip());

            tl.to(desc, 0.2, {
                scaleX: 1
            }, "+= 0.2");

            // Add the attribute "data-flip-key" to enable animation by the flipping library
            tl.call(() => desc.dataset.flipKey = "description");
            tl.play();
        }
    }


    async function initialization() {
        // Enable animation by the flipping library for svg#body
        svg.dataset.flipKey = "body";
        svg.dataset.flipNoScale = true;

        const body = await load_json();
        for (let [name, bodypart] of Object.entries(body)) {
            if (!bodypart.r) {
                bodypart.r = 20;
            }
            const circle = create_circle(bodypart.x, bodypart.y, bodypart.r);
            circle.addEventListener("click", () => {
                if (circle.classList.contains("active"))
                    return;

                remove_active_class();
                circle.classList.add("active");
                set_description(bodypart.desc);
                set_tooltip(name, bodypart.x, bodypart.y - bodypart.r + 5);
            })
        }
    }

    initialization();
})();