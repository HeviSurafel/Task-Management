const mongoose = require('mongoose');
const bcrypt=require("bcrypt")
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['Ceo', 'Employee','Department Head','supervisor'],
      required: true
  },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }, 
    employeeDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    profile: { type: String, default: 'https://www.w3schools.com/howto/img_avatar.png' },
},{
    timestamps:true
});
// Hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  
  // Compare passwords
  userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
module.exports = mongoose.model('User', userSchema);
