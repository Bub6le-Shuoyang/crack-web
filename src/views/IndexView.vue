<template>
  <div class="index-container">
    <header class="header">
      <div class="logo">Crack Project</div>
      <nav>
        <router-link to="/login" class="nav-link">登录</router-link>
      </nav>
    </header>

    <main class="hero">
      <h1>道路异常检测系统</h1>
      <p>基于先进AI技术的道路安全监测解决方案</p>
      <button @click="handleStart" class="cta-button">立刻使用</button>
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
.index-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #555;
}

.cta-button {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition:
    transform 0.2s,
    background-color 0.2s;
}

.cta-button:hover {
  background-color: #3aa876;
  transform: translateY(-2px);
}

.footer {
  text-align: center;
  padding: 1rem;
  background-color: #333;
  color: #fff;
}
</style>
