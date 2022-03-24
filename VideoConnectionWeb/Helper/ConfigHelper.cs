using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace VideoConnectionWeb.Helper
{
    public class ConfigHelper
    {
        /// <summary>
        /// RedisIP
        /// </summary>
        public static string RedisIP
        {
            get
            {
                return ConfigurationManager.ConnectionStrings["RedisIP"].ConnectionString;
            }
        }
        /// <summary>
        /// RedisPort
        /// </summary>
        public static int RedisPort
        {
            get
            {
                int Port = 6379;
                string port = ConfigurationManager.ConnectionStrings["RedisPort"].ConnectionString;
                int.TryParse(port, out Port);
                return Port;
            }
        }
        /// <summary>
        /// RedisPwd
        /// </summary>
        public static string RedisPwd
        {
            get
            {
                return ConfigurationManager.ConnectionStrings["RedisPwd"].ConnectionString;
            }
        }
        /// <summary>
        /// ApiUrl
        /// </summary>
        public static string ApiUrl
        {
            get
            {
                return ConfigurationManager.ConnectionStrings["ApiUrl"].ConnectionString;
            }
        }
        /// <summary>
        /// ApiUrl
        /// </summary>
        public static string ApiBaseUrl
        {
            get
            {
                return ConfigurationManager.ConnectionStrings["apiBaseUrl"].ConnectionString;
            }
        }
        /// <summary>
        /// ApiUrl
        /// </summary>
        public static string HubBaseUrl
        {
            get
            {
                return ConfigurationManager.ConnectionStrings["hubBaseUrl"].ConnectionString;
            }
        }
        /// <summary>
        /// 根据房间号，返回Redis房间名称
        /// </summary>
        /// <param name="RoomId">房间号</param>
        /// <returns></returns>
        public static string GetRedisRoomName(string RoomId)
        {
            return "VideoConference:" + RoomId;
        }
    }
}