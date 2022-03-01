using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace VideoConnectionWeb.Helper
{
    public static class StaticEntity
    {
        public static Dictionary<string, Task<ConnectionMultiplexer>> redisCache = new Dictionary<string, Task<ConnectionMultiplexer>>();

        public static ConnectionMultiplexer redis { get; set; }

        public static Task<ConnectionMultiplexer> GetRedisCache(string RoodId)
        {
            Task<ConnectionMultiplexer> cm = null;
            if (redisCache.ContainsKey(RoodId))
            {
                cm = redisCache[RoodId];
            }
            else
            {
                cm = ConnectionMultiplexer.ConnectAsync(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
                redisCache.Add(RoodId,cm);
            }
            if (!cm.Result.IsConnected && cm.Result.IsConnecting)
            {
                cm = ConnectionMultiplexer.ConnectAsync(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
            }
            return cm;
        }
    }
 
}