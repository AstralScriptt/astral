const colors = ["#d199ff", "#b266ff", "#e2b0ff", "#cc8cff"];
    const ballCount = 10;
    const container = document.getElementById("bg");

    // get full page height automatically!
    const worldHeight = document.documentElement.scrollHeight;
    const worldWidth = window.innerWidth;
    container.style.height = worldHeight + "px";

    const balls = [];

    for (let i = 0; i < ballCount; i++) {
      const ball = document.createElement("div");
      ball.className = "ball";

      const size = Math.random() * 80 + 50;
      ball.style.width = `${size}px`;
      ball.style.height = `${size}px`;
      ball.style.background = colors[Math.floor(Math.random() * colors.length)];

      container.appendChild(ball);

      balls.push({
        el: ball,
        x: Math.random() * worldWidth,
        y: Math.random() * worldHeight,
        dx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
        dy: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
        size
      });
    }

    function animate() {
      balls.forEach(b => {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x <= 0 || b.x + b.size >= worldWidth) b.dx *= -1;
        if (b.y <= 0 || b.y + b.size >= worldHeight) b.dy *= -1;

        b.el.style.left = `${b.x}px`;
        b.el.style.top = `${b.y}px`;
      });

      requestAnimationFrame(animate);
    }

    animate();