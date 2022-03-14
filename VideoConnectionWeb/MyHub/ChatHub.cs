using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using StackExchange.Redis;
using VideoConnectionWeb.Helper;

namespace VideoConnectionWeb.MyHub
{
    public class ChatHub : Hub
    {

        /// <summary>
        /// 发布 Redis 消息
        /// </summary>
        /// <param name="RoomId">房间号</param>
        /// <param name="Msg">消息</param>
        public void redisFB(string RoomId, string Msg)
        {
            string ConnectionId = Context.ConnectionId;
            //Task t = Task.Factory.StartNew(() =>
            //{
            //    try
            //    {

            //        DateTime dt = DateTime.Now;
            //        ConnectionMultiplexer cm = StaticEntity.Connection;
            //        ISubscriber sub = cm.GetSubscriber();
            //        string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
            //        sub.Publish(RoomName, Msg);
            //        DateTime dt2 = DateTime.Now;
            //        int sec = (int)(dt2 - dt).TotalMilliseconds;
            //        Clients.Client(ConnectionId).setHeartBeatEnd(dt, dt2,sec);
            //    }
            //    catch (StackExchange.Redis.RedisTimeoutException ex)
            //    {
            //        Clients.Client(ConnectionId).errorServer("FBTimeOut", ex.Message);
            //        LogHelper.SaveErrLog("FBTimeOut", ex);
            //    }
            //    catch (Exception ex)
            //    {
            //        Clients.Client(ConnectionId).errorServer(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"), ex.Message);
            //        LogHelper.SaveErrLog("FBException", ex);
            //    }
            //});
            Task.Factory.StartNew(() => RedisFBTask(ConnectionId, RoomId, Msg));
        }


        /// <summary>
        /// 发布 Redis 消息
        /// </summary>
        /// <param name="RoomId">房间号</param>
        /// <param name="Msg">消息</param>
        public void redisFB2(string RoomId, string Msg, string UserID)
        {
            string ConnectionId = Context.ConnectionId;
            Task t = Task.Factory.StartNew(() =>
            {
                try
                {
                    //using (Task<ConnectionMultiplexer> redis = ConnectionMultiplexer.ConnectAsync(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd))
                    //{
                    //    string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
                    //    ISubscriber sub = redis.Result.GetSubscriber();
                    //    sub.Publish(RoomName, Msg);
                    //}
                    //System.Threading.Thread.Sleep(10000);
                    ConnectionMultiplexer cm = StaticEntity.GetRedisCache(UserID);
                    ISubscriber sub = cm.GetSubscriber();
                    string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
                    sub.Publish(RoomName, Msg);

                }
                catch (StackExchange.Redis.RedisTimeoutException ex)
                {
                    Clients.Client(ConnectionId).ErrorServer("FBTimeOut", ex.Message);
                    LogHelper.SaveErrLog("FBTimeOut", ex);
                }
                catch (Exception ex)
                {
                    Clients.Client(ConnectionId).ErrorServer(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"), ex.Message);
                    LogHelper.SaveErrLog("FBException", ex);
                }
            });
        }

        /// <summary>
        /// 加入 Redis
        /// </summary>
        /// <param name="RoomId"></param>
        public void createRedis(string RoomId)
        {
            StaticEntity.SetSubstringConnection(RoomId);
            //ConnectionMultiplexer cm = StaticEntity.GetRedisCache(RoomId);

            //ConnectionMultiplexer cm = StaticEntity.SubstringConnection;
            //string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
            //if (cm != null && cm.IsConnected && !cm.IsConnecting)
            //{
            //    cm.GetSubscriber().Unsubscribe(RoomName);
            //    cm.GetSubscriber().UnsubscribeAsync(RoomName);
            //    cm.GetSubscriber().SubscribeAsync(RoomName, (channel, message) =>
            //    {
            //        string channelss = channel.ToString().Substring(16, channel.ToString().Length - 16);
            //        var hub = GlobalHost.ConnectionManager.GetHubContext<ChatHub>();
            //        hub.Clients.All.broadcastMessage(message, channelss);
            //    });
            //};
        }

        //当连接hub实例时被调用
        public override Task OnConnected()
        {
            string connId = Context.ConnectionId;
            Clients.Client(connId).SetSignalRID(connId);
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
        dynamic VideoConferenceCHRY = null;
        string RoomId = "";
        System.Timers.Timer t1 = new System.Timers.Timer(1000);//实例化Timer类，设置间隔时间为1000毫秒；
        public void startTest()
        {
            GetWebApi gwa = new GetWebApi();
            dynamic vc = gwa.GetVideoConference("d982d65e370c417abe0e7c6c21bb9d3f");
            string Title = vc.Data.VideoConference.Title;
            RoomId = vc.Data.VideoConference.RoomId;

            VideoConferenceCHRY = vc.Data.VideoConferenceCHRY;
            t1.Elapsed += new System.Timers.ElapsedEventHandler(TestUserHeartBeat);//到达时间的时候执行事件；
            t1.AutoReset = true;//设置是执行一次（false）还是一直执行(true)；
            t1.Enabled = true;//是否执行System.Timers.Timer.Elapsed事件；
           
        }

        private void TestUserHeartBeat(object source, System.Timers.ElapsedEventArgs e)
        {
            for (int i = 0; i < VideoConferenceCHRY.Count; i++)
            {
                string tempID = VideoConferenceCHRY[i].ID;
                string tempName = VideoConferenceCHRY[i].UserName;
                var data1 = new
                {
                    reCode = "25",
                    ReUserid = "",
                    ReUserQYBH = "",
                    ReUserName = "",
                    SendUserID = tempID,
                    SendUserName = tempName,
                    Content = "心跳",
                    Data = new
                    {
                        State = 0,
                        CameraState = 0,
                        MicState = 0,
                    }
                };
                TaskFactory taskFactory = new TaskFactory();
                taskFactory.StartNew(RedisFB, data1);
            }
        }

        /// <summary>
        /// 发布 Redis 消息
        /// </summary>
        /// <param name="RoomId">房间号</param>
        /// <param name="Msg">消息</param>
        public void RedisFB(dynamic data1)
        {
            string Msg = JsonHelper.SerializeJSON(data1);

            //每个用户创建一个 ConnectionMultiplexer 对象
            ConnectionMultiplexer cm = StaticEntity.Connection;
            string RoomName = ConfigHelper.GetRedisRoomName(RoomId);
            ISubscriber sub = cm.GetSubscriber();
            sub.Publish(RoomName, Msg);
        }

        /// <summary>
        /// 发布 Redis 消息
        /// </summary>
        /// <param name="RoomId">房间号</param>
        /// <param name="Msg">消息</param>
        public void RedisFBTask(string ConnectionId,string RID, string Msg)
        {
            try
            {
                DateTime dt = DateTime.Now;
                dynamic o = JsonConvert.DeserializeObject(Msg);
                // o.ReUserName = o.ReUserName + "【Hub收到时间：】" + dt.ToString("HH:mm:ss.fff");
                Msg = JsonHelper.SerializeJSON(o);
                ConnectionMultiplexer cm = StaticEntity.Connection;
                ISubscriber sub = cm.GetSubscriber();
                string RoomName = ConfigHelper.GetRedisRoomName(RID);
                sub.Publish(RoomName, Msg);
                DateTime dt2 = DateTime.Now;
                int sec = (int)(dt2 - dt).TotalMilliseconds;
                Clients.Client(ConnectionId).setHeartBeatEnd(dt.ToString("HH:mm:ss.fff"), dt2.ToString("HH:mm:ss.fff"), sec);
            }
            catch (StackExchange.Redis.RedisTimeoutException ex)
            {
                Clients.Client(ConnectionId).errorFBTimeOut("FBTimeOut", DateTime.Now.ToString("HH:mm:ss.fff")+"：" +ex.Message);
                LogHelper.SaveErrLog("FBTimeOut", ex);
            }
            catch (Exception ex)
            {
                Clients.Client(ConnectionId).errorServer(DateTime.Now.ToString("HH:mm:ss.fff"), ex.Message);
                LogHelper.SaveErrLog("FBException", ex);
            }
        }
    }
}