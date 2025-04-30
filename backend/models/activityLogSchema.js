const mongoose = require('mongoose');
const activityLogSchema =  mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
});
module.exports= mongoose.model('ActivityLog', activityLogSchema);