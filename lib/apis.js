module.exports = {
    'statuses/public_timeline': {
        params: {
            count: 10
        }
    },
    'users/show':{
        params:{

        }
    },
    'statuses/update':{
        method:'post',
        params:{
            status:'hello, world',
            visible:0
        }
    }
}