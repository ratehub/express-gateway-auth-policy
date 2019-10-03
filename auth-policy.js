const { auth } = require('@ratehub/auth-client-js');

module.exports = {
    name: 'auth',
    schema: {
        $id: 'http://www.ratehub.ca/schemas/policies/auth-policy.json',
        type: 'object',
        properties: {
            authServiceUri: {
                type: 'string',
                format: 'url',
                default: 'https://auth.ratehub.ca'
            },
            domainKey:{
                type: 'string',
                description: 'provide domain key to validate against'
            }
        }, required: ['domainKey']
    },
    policy: (actionParams) => {
        const uri = actionParams.authServiceUri;
        const key = actionParams.domainKey;
        const authService = auth(uri, key);

        return async (req, res, next) => {
            if (!req.headers.authorization) {
                res.status(401);
                return res.json({ error: 'unauthorized' });
            }else{
                const token = req.headers.authorization.replace('Bearer' ,'').replace(/ /g,'');
                try {
                    await authService.validateAuthToken(token);
                }catch(error){
                    console.error(error);
                    res.status(401);
                    return res.json({error: 'unauthorized'})
                }
            }
            return next();
        };
    }
};
