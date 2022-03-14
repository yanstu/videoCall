using Microsoft.AspNet.SignalR;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using VideoConnectionWeb.MyHub;

namespace VideoConnectionWeb.Helper
{
    public static class StaticEntity
    {
        public static Dictionary<string, ConnectionMultiplexer> redisCache = new Dictionary<string, ConnectionMultiplexer>();
        public static ConnectionMultiplexer redis { get; set; }

        public static ConnectionMultiplexer GetRedisCache(string RoodId)
        {
            ConnectionMultiplexer cm = null;
            if (redisCache.ContainsKey(RoodId))
            {
                cm = redisCache[RoodId];
            }
            else
            {
                cm = ConnectionMultiplexer.Connect(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
                if (!redisCache.ContainsKey(RoodId))
                {
                    redisCache.Add(RoodId, cm);
                }
            }
            if (!cm.IsConnected && cm.IsConnecting)
            {
                cm = ConnectionMultiplexer.Connect(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
            }
            return cm;
        }

        private static Lazy<ConnectionMultiplexer> lazyConnection = new Lazy<ConnectionMultiplexer>(() => {
            return ConnectionMultiplexer.Connect(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
        });

        public static ConnectionMultiplexer Connection
        {
            get
            {
                return lazyConnection.Value;
            }
        }

        private static Lazy<ConnectionMultiplexer> lazySubstringConnection = new Lazy<ConnectionMultiplexer>(() => {
            return ConnectionMultiplexer.Connect(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
        });

        public static Dictionary<string, ConnectionMultiplexer> redisSubstringCache = new Dictionary<string, ConnectionMultiplexer>();
        public static ConnectionMultiplexer SetSubstringConnection(string RoomId)
        {
            ConnectionMultiplexer cm = null;
            if (redisSubstringCache.ContainsKey(RoomId))
            {
                cm = redisSubstringCache[RoomId];
            }
            else
            {
                cm = ConnectionMultiplexer.Connect(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
                lock (redisSubstringCache)
                {
                    if (!redisSubstringCache.ContainsKey(RoomId))
                    {
                        string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
                        cm.GetSubscriber().SubscribeAsync(RoomName, (channel, message) =>
                        {
                            string channelss = channel.ToString().Substring(16, channel.ToString().Length - 16);
                            var hub = GlobalHost.ConnectionManager.GetHubContext<ChatHub>();
                            hub.Clients.All.broadcastMessage(message, channelss);
                        });
                        redisSubstringCache.Add(RoomId, cm);
                    }
                }
            }
            if (!cm.IsConnected && cm.IsConnecting)
            {
                cm = ConnectionMultiplexer.Connect(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd);
            }
            return cm;
        }
    }
 
}