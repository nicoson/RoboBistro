// 配置 API Key 和 App ID
// 从 Ping++ 管理平台应用信息里获取
//var API_KEY = "sk_test_fTa5yHSyDiHGzPiDC858G040" // Test Key
var API_KEY = "sk_live_SyPifP4Ou1OK4qXjb18mLyj9" // Live Key

var APP_ID = "app_jHyX5CiXj5yHO4aP" // 这里填入你的应用 ID

var pingpp = require('pingpp')(API_KEY);
// pingpp.parseHeaders(/*headers*/); // 把从客户端传上来的 Headers 传到这里

// 设置请求签名私钥路径
pingpp.setPrivateKeyPath(__dirname + '/your_rsa_private_key.pem');
// 或者设置请求签名私钥内容，请保留换行符 "\n"
// pingpp.setPrivateKey('-----BEGIN RSA PRIVATE KEY-----\n\
// ......\n\
// ... 私钥内容 ...\n\
// ......\n\
// -----END RSA PRIVATE KEY-----');

var channel = 'alipay_qr'; // 选择渠道
var extra = {};
switch (channel) {
  case 'alipay_wap':
    extra = {
      'success_url': 'http://www.yourdomain.com/success',
      'cancel_url': 'http://www.yourdomain.com/cancel'
    };
    break;
  case 'upacp_wap':
    extra = {
      'result_url': 'http://www.yourdomain.com/result'
    };
    break;
  // 请根据 API 文档说明，根据不同渠道，添加不同的 extra 参数。
}
var crypto = require('crypto');


function prepayrequest(){};

prepayrequest.prePayCreate = function(amount, callback){
	var order_no = crypto.createHash('md5')
              .update(new Date().getTime().toString())
              .digest('hex').substr(0, 16);
	pingpp.charges.create({
	  order_no:  order_no,
	  app:       { id: APP_ID },
	  channel:   channel,
	  amount:    amount,
	  client_ip: "127.0.0.1",
	  currency:  "cny",
	  subject:   "test request",
	  body:      "test Body",
	  extra:     extra
	}, function(err, charge) {
	  // YOUR CODE
	  console.log(err);
	  console.log(charge);

	  return callback(charge);
	});
};

prepayrequest.alipayOrderQuery = function(orderId, callback){
	pingpp.charges.retrieve(
		orderId,
		function(err, charge) {
			if(err){
				console.log(err)
				return err;
			}else{
				console.log(charge)
				return callback(charge);
			}
		}
	);	
};



module.exports = prepayrequest;