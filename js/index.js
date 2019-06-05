(function () {
    "use strict";

    let svg = document.getElementById("body");
    let tooltip;

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

    function assign_attributes(el, attr) {
        for (let [name, value] of Object.entries(attr)) {
            el.setAttribute(name, value);
        }
    }

    function create_circle(x, y, r) {
        const circle = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "circle"));
        assign_attributes(circle, {
            cx: x,
            cy: y,
            r: r
        });
        return circle;
    }

    function remove_active_class() {
        for (let el of svg.querySelectorAll(".active")) {
            el.classList.remove("active");
        }
    }

    function create_triangle(tooltip, tooltip_w, tooltip_h) {
        const w = 15, h = 10;
        const x = (tooltip_w - w) / 2, y = tooltip_h;

        const triangle = tooltip.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path"));

        triangle.setAttribute("d", `m ${x} ${y} l ${w / 2} ${h} l ${w / 2} -${h} z`);

        return triangle;
    }

    function create_tooltip(w, h) {
        const tooltip = svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
        const rect = tooltip.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "rect"));
        const text = tooltip.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "text"));

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
            const old = tooltip;
            TweenLite.to(old, 0.3, {
                opacity: 0,
                y: "-=50px",
                ease: Power1.easeIn,
                onComplete: () => old.remove()
            });

        }
        tooltip = create_tooltip(w, h);

        x -= w / 2;
        y -= h + 5;

        TweenLite.from(tooltip, 0.2, {
            opacity: 0
        })
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

        //tooltip.setAttribute("transform", `translate(${x}, ${y})`);
        let text = tooltip.querySelector("text");

        text.innerHTML = value;
    }

    function set_description(text) {
        const desc = document.getElementById("description");

        if (desc.innerText) {
            const flipping = new Flipping();
            flipping.read();
            desc.innerText = text;
            flipping.flip();
        } else {
            const tl = new TimelineLite();
            tl.set(desc, {
                transformOrigin: "left"
            })
            const flipping = new Flipping();
            flipping.read();

            tl.set(desc, {
                text: text,
                scaleX: 0
            });
            tl.call(() => flipping.flip());
            tl.to(desc, 0.2, {
                scaleX: 1
            }, "+= 0.2");
            tl.call(() => desc.dataset.flipKey = "description");
            tl.play();
        }
    }


    async function initialization() {
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

                // flipping.flip();
            })
        }
    }

    initialization();
})();