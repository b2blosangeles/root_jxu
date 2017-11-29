var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
var config = require(env.config_path + '/config.json').db;

res.send(config.root);

var CP = new pkg.crowdProcess();
var _f = {};

for (var i = 0; i < v.length; i++) {
	_f['P_'+i] = (function(i) {
		return function(cbk) {
			if (isIp(v[i])) {
				pkg.request({
					url: 'http://'+v[i]+'/checkip/',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					if (error) {
						cbk(false);
					} else {
						var ips = [];
						try { ips = JSON.parse(body);} catch (e) { }
						if (ips.indexOf(v[i]) != -1) {
							cbk(v[i]);
						} else {
							cbk(false)
						}
					}
				   });
			} else {
				cbk(false);
			}
		}	
	})(i);
}


CP.parallel(
	_f,
	function(data) {
		if (data.status == "success") {
			var ip = '';
			for (var o in data.results) {
				if (data.results[o]) {
					
					ip = data.results[o];
					break;
				}
			}
			if (ip) {
				var connection = mysql.createConnection(cfg0);
				connection.connect();
				var str = 'INSERT INTO `cloud_server` (`server_ip`,`space`,`created`, `updated`) VALUES (' +
				    "'"+ip+"','" + JSON.stringify(space) + "',NOW(), NOW())  " +
				    " ON DUPLICATE KEY UPDATE `updated` = NOW(), `space` = '" + JSON.stringify(space) + "'; ";
				// encodeURIComponent
				connection.query(str, function (error, results, fields) {
					connection.end();
					if (error) {
						res.send({status:'error', value:error.message});
					} else {
						res.send({status:'success', value:ip});
					}
				}); 
			} else {
				res.send({status:'error', value:'No IP Addresss'});
			}	
			
		} else {
			res.send({status:'error', value:JSON.stringify(data)});
		}
	},
	10000
);

