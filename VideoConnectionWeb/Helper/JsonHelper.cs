using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VideoConnectionWeb.Helper
{
    /// <summary>
    /// JSON
    /// </summary>
    public class JsonHelper
    {
        /// <summary>
        /// 将实体类序列化为JSON
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="data"></param>
        /// <returns></returns>
        static public string SerializeJSON<T>(T data)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(data);
        }

        /// <summary>
        /// 反序列化JSON
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="json"></param>
        /// <returns></returns>
        static public T DeserializeJSON<T>(string json)
        {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(json);
        }

    }
}