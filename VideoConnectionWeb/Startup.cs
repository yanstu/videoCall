using Microsoft.AspNet.SignalR;
using Microsoft.Owin.Cors;
using Owin;

namespace VideoConnectionWeb
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
