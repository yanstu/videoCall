using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace VideoConnectionWeb.Helper
{
    public static class LogHelper
    {
        static System.Threading.ReaderWriterLockSlim LogWriteLock = new System.Threading.ReaderWriterLockSlim();

        /// <summary>
        /// 写入错误日志文件
        /// </summary>
        public static void SaveErrLog(string Msg)
        {
            System.Threading.ThreadPool.QueueUserWorkItem(new System.Threading.WaitCallback((A) =>
            {
                try
                {
                    LogWriteLock.EnterWriteLock();
                    string log = string.Format("【时间】{0}【消息】{1}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"), Msg);
                    File.AppendAllText(GetLogPath() + @"\errorlog.txt", log + "\r\n");
                }
                catch (Exception ex)
                {

                }
                finally
                {
                    LogWriteLock.ExitWriteLock();
                }
            }));
        }

        /// <summary>
        /// 写入日志文件
        /// </summary>
        public static void SaveLog(string logStr)
        {
            System.Threading.ThreadPool.QueueUserWorkItem(new System.Threading.WaitCallback((A) =>
            {
                try
                {
                    LogWriteLock.EnterWriteLock();
                    string log = string.Format("【时间】{0}【日志】{1}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"), logStr);
                    File.AppendAllText(GetLogPath() + @"\log.txt", log + "\r\n");
                }
                catch (Exception ex)
                {

                }
                finally
                {
                    LogWriteLock.ExitWriteLock();
                }
            }));
        }

        /// <summary>
        /// 写入错误日志文件
        /// </summary>
        public static void SaveErrLog(string Msg, Exception e)
        {
            System.Threading.ThreadPool.QueueUserWorkItem(new System.Threading.WaitCallback((A) =>
            {
                try
                {
                    LogWriteLock.EnterWriteLock();
                    string log = string.Format("【时间】{0}【操作错误】{1}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"), Msg+"：" +e.Message + " " + e.StackTrace);
                    File.AppendAllText(GetLogPath() + @"\errorlog.txt", log + "\r\n");
                }
                catch (Exception ex)
                {

                }
                finally
                {
                    LogWriteLock.ExitWriteLock();
                }
            }));
        }

        private static string GetLogPath() {
            string url = "C:\\SPLXWebLog";
            if (!System.IO.Directory.Exists(url))
            {
                System.IO.Directory.CreateDirectory(url);
            }
            return url;
        }
    }
}