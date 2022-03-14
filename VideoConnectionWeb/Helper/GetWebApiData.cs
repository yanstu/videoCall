using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace VideoConnectionWeb.Helper
{
    public class GetWebApi
    {
        //string WSLLZApiUrl = "http://dbllz.gzrd.gov.cn:8081/api/";
        //string pwd = "gzrd-llz1";
        string WSLLZApiUrl = "https://testvideoapi.gzshifang.com:9011/api/";
        string pwd = "atest2021llz";
        public dynamic GetVideoConference(string VideoConferenceID)
        {
            dynamic r = null;
            var httpClient = new HttpClient();
            Dictionary<string, string> dicContent = new Dictionary<string, string>();
            dicContent.Add("LoginID", "贵州省管理员");
            dicContent.Add("Pwd", pwd);
            dicContent.Add("LX", "1");
            HttpContent content = new FormUrlEncodedContent(dicContent);
            //content.Headers.Add("SecretKey", ConfigHelper.GetSJZXApiSecretKey);
            HttpResponseMessage res = httpClient.PostAsync(WSLLZApiUrl + "Login/Login", content).Result;
            string responseJson = "";
            if (res.IsSuccessStatusCode)
            {
                responseJson = res.Content.ReadAsStringAsync().Result;
            }
            else
            {
                throw new Exception("调用接口出错！");
            }
            dynamic resObj = JsonConvert.DeserializeObject(responseJson);
            if (resObj.Code == 0)
            {
                r = FindVideoConferenceById(resObj, VideoConferenceID);
            }
            else
            {
                throw new Exception("登录出错！错误消息：" + resObj.Msg);
            }
            return r;
        }

        private dynamic FindVideoConferenceById(dynamic model, string VideoConferenceID)
        {
            var httpClient = new HttpClient();
            string p = string.Format("?ID={0}", VideoConferenceID);
            httpClient.DefaultRequestHeaders.Add("Token", model.Data.Token.ToString());
            HttpResponseMessage res = httpClient.GetAsync(WSLLZApiUrl + "VideoConference/FindVideoConferenceById" + p).Result;
            string responseJson = "";
            if (res.IsSuccessStatusCode)
            {
                responseJson = res.Content.ReadAsStringAsync().Result;
            }
            else
            {
                throw new Exception("调用查询会议接口出错！");
            }
            dynamic resObj = JsonConvert.DeserializeObject(responseJson);
            if (resObj.Code == 0)
            {

            }
            else
            {
                throw new Exception("查询会议出错！错误消息：" + resObj.Msg);
            }
            return resObj;
        }
    }
}