<template>
  <div class="index-container">
    <!-- 背景装饰球 -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <header class="header">
      <div class="logo">Crack Project</div>
      <nav>
        <router-link to="/login" class="nav-link">登录</router-link>
      </nav>
    </header>

    <main class="hero">
      <div class="hero-content">
        <h1>道路异常检测系统</h1>
        <p>基于先进AI技术的道路安全监测解决方案</p>
        <button @click="handleStart" class="cta-button">立刻使用</button>
      </div>
    </main>

    <footer class="footer">
      <p>&copy; 2026 Crack Project. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleStart = () => {
  router.push('/login')
}
</script>

<style scoped>
@import '@/assets/css/login.css';

/* Override or add specific styles for IndexView */
.index-container {
  /* Inherits base styles from login.css */
  flex-direction: column;
  justify-content: space-between; /* Header top, Footer bottom */
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  z-index: 2;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #22c1c3 0%, #96f18e 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  animation: gradient 3s ease infinite;
}

.nav-link {
  text-decoration: none;
  color: #525f7f;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(34, 193, 195, 0.1);
  color: #22c1c3;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  width: 100%;
  z-index: 1;
}

.hero-content {
  padding: 3rem 4rem;
  max-width: 800px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Removed hover transform for hero-content */

h1 {
  font-size: 4rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #22c1c3 0%, #96f18e 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  line-height: 1.2;
  animation: gradient 3s ease infinite;
}

p {
  font-size: 1.8rem;
  margin-bottom: 3rem;
  color: #525f7f;
  font-weight: 400;
}

.cta-button {
  padding: 1.5rem 4rem;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #22c1c3 0%, #96f18e 100%);
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(34, 193, 195, 0.4);
  /* transition: all 0.3s ease; */ /* Disable transition */
  animation: gradient 3s ease infinite; /* Re-enable animation for background */
}

.cta-button:hover {
  /* transform: translateY(-3px) scale(1.05); */ /* Disable hover transform */
  /* box-shadow: 0 8px 25px rgba(66, 185, 131, 0.6); */ /* Disable hover shadow change */
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.footer {
  width: 100%;
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: #8898aa;
  font-size: 0.9rem;
  z-index: 2;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  .hero-content {
    padding: 2rem;
    margin: 1rem;
  }
}
</style>
