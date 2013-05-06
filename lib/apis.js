module.exports = {
    'statuses/public_timeline': {
        method: 'get',
        params: {
            count: 10
        }
    },
    'users/show':{
        method:'get',
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