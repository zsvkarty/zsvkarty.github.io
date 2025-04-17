// Particle system for hero section
document.addEventListener("DOMContentLoaded", () => {
    const heroSection = document.querySelector(".hero")
    if (!heroSection || heroSection.classList.contains("no-particles")) return
  
    // Create canvas element
    const canvas = document.createElement("canvas")
    canvas.className = "particles-canvas"
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.pointerEvents = "none" // Make sure it doesn't interfere with clicks
    canvas.style.zIndex = "1" // Place it above the background but below the content
  
    // Insert canvas as the first child of hero section
    heroSection.insertBefore(canvas, heroSection.firstChild)
  
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = heroSection.offsetWidth
      canvas.height = heroSection.offsetHeight
    }
  
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
  
    // Get canvas context
    const ctx = canvas.getContext("2d")
  
    // Particle class
    class Particle {
      constructor() {
        this.reset()
      }
  
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 1
        this.speedY = (Math.random() - 0.5) * 1
        this.opacity = Math.random() * 0.5 + 0.2
        this.color = `rgba(255, ${Math.floor(Math.random() * 76) + 41}, ${Math.floor(Math.random() * 41)}, ${this.opacity})`
      }
  
      update() {
        this.x += this.speedX
        this.y += this.speedY
  
        // Reset particle if it goes out of bounds
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset()
        }
      }
  
      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  
    // Create particles
    const particles = []
    const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 100)
  
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }
  
    // Connect particles with lines if they are close enough
    function connectParticles() {
      const maxDistance = 150
  
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
  
          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            ctx.strokeStyle = `rgba(255, 76, 41, ${opacity * 0.2})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }
  
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })
  
      connectParticles()
  
      requestAnimationFrame(animate)
    }
  
    animate()
  
    // Add mouse interaction
    const mouse = {
      x: null,
      y: null,
      radius: 150,
    }
  
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    })
  
    canvas.addEventListener("mouseleave", () => {
      mouse.x = null
      mouse.y = null
    })
  
    // Update particle behavior to react to mouse
    const originalUpdate = Particle.prototype.update
    Particle.prototype.update = function () {
      originalUpdate.call(this)
  
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x
        const dy = this.y - mouse.y
        const distance = Math.sqrt(dx * dx + dy * dy)
  
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance
          const force = (mouse.radius - distance) / mouse.radius
  
          this.speedX += forceDirectionX * force * 0.5
          this.speedY += forceDirectionY * force * 0.5
        }
      }
    }
  })
  
  