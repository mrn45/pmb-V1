with open('server.ts', 'r') as f:
    content = f.read()

start_idx = content.find("// Health & Diagnostics")
end_idx = content.find("// Auth: Login")

health_route = """// Health & Diagnostics
app.get("/api/health", async (req, res) => {
  try {
    const db = await readDb();
    res.json({
      status: "ok",
      vercel: !!process.env.VERCEL,
      usersCount: db?.users?.length || 0,
      usersList: db?.users?.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        fullName: u.fullName,
        hasPassword: !!(u as any).password
      })) || []
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

"""

content = content[:start_idx] + health_route + content[end_idx:]

with open('server.ts', 'w') as f:
    f.write(content)
