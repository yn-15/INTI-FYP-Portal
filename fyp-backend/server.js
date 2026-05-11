import app from './src/app.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ FYP Backend running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
