const artistRequestRoutes = require('./routes/artistRequestRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/artist-requests', artistRequestRoutes); 