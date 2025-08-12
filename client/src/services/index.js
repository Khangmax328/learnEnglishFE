const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.options('*', cors());
