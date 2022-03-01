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
            try
            {
                context.Response.ContentType = "text/plain";
                string type = context.Request["Infotype"];
                string RoomId = context.Request["RoomId"];
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
                    default:
                        break;
                }
            }
            catch (Exception)
            {
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