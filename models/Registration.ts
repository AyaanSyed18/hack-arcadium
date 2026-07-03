import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
});

const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  phone: { type: String, required: true },
  github: { type: String, default: null },
  linkedin: { type: String, default: null },
  discord: { type: String, required: true },
  teamMembers: { 
    type: [TeamMemberSchema], 
    validate: [(val: any[]) => val.length <= 3, '{PATH} exceeds the limit of 3 team members']
  },
}, { timestamps: true });

export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
