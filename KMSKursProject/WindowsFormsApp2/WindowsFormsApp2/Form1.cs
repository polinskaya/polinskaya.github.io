using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WindowsFormsApp2
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        int nCos = 3;
        //double hc = 0.96095;
        //double mr = 2.96085;
        //double ms = 4.96075;

        double hc = 2.3;
        double mr = 2.5;
        double ms = 3.4;

        double AmpValue = 0.1;

        private void Form1_Load(object sender, EventArgs e)
        {
            RedrawChart();
            
        }


        private void RedrawChart()
        {
            chart1.Series[0].Points.Clear();
            chart1.ChartAreas[0].AxisX.MajorGrid.Interval = 1;
            chart1.ChartAreas[0].AxisY.MajorGrid.Interval = 1;
            chart1.ChartAreas[0].AxisY.Maximum = 5;
            chart1.ChartAreas[0].AxisY.Minimum = -5;
            chart1.ChartAreas[0].AxisX.Maximum = 5;
            chart1.ChartAreas[0].AxisX.Minimum = -5;

            List<double> xs = new List<double>();
            List<double> ys = new List<double>();
            for (int i = 0; i < 200; i++)
            {
                try
                {
                    xs.Add(Math.Pow(mr * Math.Cos(GetPeriod(i)), nCos) + hc * Math.Sin(GetPeriod(i)));
                    ys.Add(ms * Math.Cos(GetPeriod(i)));
                    //chart1.Series[0].Points.AddXY(, );
                }
                catch (Exception)
                {
                    throw;
                }
            }
         //   AdjastValues(-5, 5, xs, ys);

            for (int i = 0; i < 200; i++)
            {
                chart1.Series[0].Points.AddXY(xs[i], ys[i]);
            }
        }

        private void AdjastValues(double min, double max, List<double> xs, List<double> ys)
        {
            if(xs.Any(value => value > max || value < min ) || ys.Any(value => value > max || value < min))
            {
                for (int i = 0; i < 200; i++)
                {
                    if (xs[i] < 0)
                    {
                        xs[i] += 0.1;
                    }
                    else
                    {
                        xs[i] -= 0.1;
                    }

                    if (ys[i] < 0)
                    {
                        ys[i] += 0.1;
                    }
                    else
                    {
                        ys[i] -= 0.1;
                    }

                }
                AdjastValues(min, max, xs, ys);
            }
        }

        private double GetPeriod(double pts)
        {
            return (pts) / (199) * 2 * Math.PI;
        }

        private void TrackBar4_Scroll(object sender, EventArgs e)
        {
            nCos = trackBar4.Value;
            RedrawChart();
        }

        private void TrackBar3_Scroll(object sender, EventArgs e)
        {
            ms = trackBar3.Value;
            RedrawChart();
        }

        private void TrackBar2_Scroll(object sender, EventArgs e)
        {
            mr = trackBar2.Value;
            RedrawChart();
        }

        private void TrackBar1_Scroll(object sender, EventArgs e)
        {
            hc = trackBar1.Value;
            RedrawChart();
        }

        private double I, Xk, Yk, Xm, Ym, Sx, Sy, Hk, Bost;

        private void SetValues()
        {
            switch (AmpValue)
            {
                case 0.1:
                    {

                        break;
                    }
                default:
                    break;
            }
        }
    }
}
