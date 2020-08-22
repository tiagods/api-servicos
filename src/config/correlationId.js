const correlator = require('correlation-id');

const getCid = req => {
    let cid = req.headers['x-cid'];
    if(!cid){
        cid = correlator.withId(()=>{
            return correlator.getId();
        })
    };
    return cid;
}

module.exports = {
    getCid(req){
        return getCid(req);
    },
}