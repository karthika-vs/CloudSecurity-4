const express = require('express');
const expressOasGenerator = require('express-oas-generator')
const cors=require('cors');
const records=require('./routes/record');
const app = express();
const port = 5050;


require('dotenv').config({ path: 'config.env' });
const PORT = process.env.PORT || 5050;
const { specs,swaggerUi} = require('./swagger');

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use("/record", records);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});