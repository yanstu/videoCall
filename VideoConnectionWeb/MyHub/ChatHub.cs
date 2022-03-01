using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using StackExchange.Redis;
using VideoConnectionWeb.Helper;

namespace VideoConnectionWeb.MyHub
{
    public class ChatHub : Hub
    {
        public void send(string name, string message)
        {
            Clients.All.broadcastMessage(name, message);
        }

        /// <summary>
        /// 发布 Redis 消息
        /// </summary>
        /// <param name="RoomId">房间号</param>
        /// <param name="Msg">消息</param>
        public  void redisFB(string RoomId, string Msg)
        {
            try
            {
                using (Task<ConnectionMultiplexer> redis = ConnectionMultiplexer.ConnectAsync(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd))
                {
                    string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
                    ISubscriber sub = redis.Result.GetSubscriber();
                    sub.Publish(RoomName, Msg);
                }
            }
            catch (Exception)
            {
            }
        }

        /// <summary>
        /// 加入 Redis
        /// </summary>
        /// <param name="RoomId"></param>
        public void createRedis(string RoomId)
        {
            try
            {
                Task<ConnectionMultiplexer> cm = StaticEntity.GetRedisCache(RoomId);
                string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
                if (cm != null && cm.Result.IsConnected && !cm.Result.IsConnecting)
                {
                    cm.Result.GetSubscriber().Unsubscribe(RoomName);
                    cm.Result.GetSubscriber().UnsubscribeAsync(RoomName);
                    cm.Result.GetSubscriber().SubscribeAsync(RoomName, (channel, message) =>
                    {
                        string channelss = channel.ToString().Substring(16, channel.ToString().Length - 16);
                        var hub = GlobalHost.ConnectionManager.GetHubContext<ChatHub>();
                        hub.Clients.All.broadcastMessage(message, channelss);
                    });
                };
            }
            catch (Exception)
            {
            }
        }

        //当连接hub实例时被调用
        public override Task OnConnected()
        {
            string connId = Context.ConnectionId;
            return base.OnConnected();
        }

        //当失去连接或链接超时时被调用
        public override Task OnDisconnected(bool stopCalled)
        {
            //stopCalled=true时，客户端关闭连接
            //stopCalled=false时，出现链接超时
            return base.OnDisconnected(stopCalled);
        }

        //重新连接时被调用
        public override Task OnReconnected()
        {
            return base.OnReconnected();
        }
    }
}