const bcrypt = require('bcryptjs');

async function test() {
  try {
    console.log('Testing bcryptjs...');
    const password = 'test123456';
    
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated:', salt);
    
    const hash = await bcrypt.hash(password, salt);
    console.log('Hash generated:', hash);
    
    const match = await bcrypt.compare(password, hash);
    console.log('Password match:', match);
    
    console.log('✅ bcryptjs is working correctly');
  } catch (err) {
    console.error('❌ bcryptjs error:', err.message);
  }
}

test();
