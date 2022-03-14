using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VideoConnectionWeb.Helper;
using System.Web.Services;
using System.Threading.Tasks;

namespace VideoConnectionWeb.Handler
{
    /// <summary>
    /// RedisHandler 的摘要说明
    /// </summary>
    public class RedisHandler : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string type = context.Request["Infotype"];
            string RoomId = context.Request["RoomId"];
            try
            {
                switch (type)
                {
                    case "GetInfo":
                        using (Task<ConnectionMultiplexer> redis = ConnectionMultiplexer.ConnectAsync(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd))
                        {
                            string RoomName = ConfigHelper.GetRedisRoomName(RoomId) + "SpeakerID";
                            RedisValue rv = redis.Result.GetDatabase().HashGet(RoomName, "VideoConference");
                            context.Response.Write(rv.ToString());
                        }
                        break;
                    case "GetCache":
                        //using (Task<ConnectionMultiplexer> redis = ConnectionMultiplexer.ConnectAsync(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd))
                        //{
                            ConnectionMultiplexer redis2 = StaticEntity.Connection;
                            string RoomName2 = ConfigHelper.GetRedisRoomName(RoomId);
                            RedisValue rv2 = redis2.GetDatabase().HashGet(RoomName2, "VideoConference");
                            context.Response.Write(rv2.ToString());
                        //}
                        break;
                    case "RedisFB":
                        using (Task<ConnectionMultiplexer> redis = ConnectionMultiplexer.ConnectAsync(ConfigHelper.RedisIP + ":" + ConfigHelper.RedisPort + ",password=" + ConfigHelper.RedisPwd))
                        {
                            string RoomName = ConfigHelper.GetRedisRoomName(RoomId) + "SpeakerID";
                            RedisValue rv = redis.Result.GetDatabase().HashGet(RoomName, "VideoConference");
                            context.Response.Write(rv.ToString());
                        }
                        break;
                    default:
                        break;
                }
            }
            catch (Exception ex)
            {
                context.Response.Write(type+"访问出错！"+ex.Message);
                LogHelper.SaveErrLog("Handler"+type,ex);
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}