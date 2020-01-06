using System;
using System.Globalization;
using Assets.Scripts.EventSystem;
using UnityEngine;
using UnityEngine.UI;

namespace Assets.Scripts
{
    public class TableValues : MonoBehaviour
    {
        [SerializeField]
        Text[] Line1;

        [SerializeField]
        Text[] Line2;

        [SerializeField]
        Text[] Line3;

        [SerializeField]
        Text[] Line4;

        [SerializeField]
        Text[] Line5;

        [SerializeField]
        Text[] Line6;

        #region CalculationConstants

        private const double NOne = 2900;
        private const double NTwo = 3;
        private const double ROne = 12;
        private const double R = 9000;
        private const double A = 0.07;
        private const double S = 0.0003;
        private const double C = 0.6;

        //X = Xm(1.6)
        //U1 = 0.5*1*X
        //H = (n1/2p1AR1)*U1

        //Uc1 = 0.5*0.005*Ym

        //Hk = N1*Uk6/2*a*pi*R1
        //Uk6 = 0.5*1*Xk6
        #endregion

        [SerializeField]
        InputField textInput;

        Text[][] matrix = new Text[6][];

        const float y = 0.0283f;//мм

        void Start()
        {
            matrix[0] = Line1;
            matrix[1] = Line2;
            matrix[2] = Line3;
            matrix[3] = Line4;
            matrix[4] = Line5;
            matrix[5] = Line6;
            EventManager.AmpChanger += EventManagerOnAmpChanger;
        }

        private float currentColor;

        private void EventManagerOnAmpChanger(float color)
        {
            currentColor = color;
            if (color == 1)
            {
                Line = Line1;
            }

            if (color == 2)
            {
                Line = Line2;
            }

            if (color == 3)
            {
                Line = Line3;
            }

            if (color == 4)
            {
                Line = Line4;
            }

            if (color == 5)
            {
                Line = Line5;
            }

            if (color == 6)
            {
                Line = Line6;
            }
        }

        private Text[] Line;

        public void WriteValue()
        {
            string valueText = textInput.text;
            double newValue = 0.0;

            if (!(double.TryParse(valueText, out newValue) && newValue != 0.0))
            {
                textInput.text = "";
                return;
            }

            if (Line[0].text == "_")
            {
                if (EventManager.WriteValue()) Line[0].text = newValue.ToString(CultureInfo.InvariantCulture);
                else return;
            }
            else if (Line[1].text == "_")
            {
                if (EventManager.WriteValue()) Line[1].text = newValue.ToString(CultureInfo.InvariantCulture);
                else return;
            }
            else if (Line[2].text == "_")
            {
                if (EventManager.WriteValue()) Line[2].text = newValue.ToString(CultureInfo.InvariantCulture);
                else return;
            }
            else if (Line[3].text == "_")
            {
                if (EventManager.WriteValue()) Line[3].text = newValue.ToString(CultureInfo.InvariantCulture);
                else return;
                FillRestOfLine(Line);
            }

            textInput.text = "";
        }

        //X = Xm(1.6)
        //U1 = 0.5*1*X
        //H = (n1/2p1AR1)*U1

        //Uc1 = 0.5*0.005*Ym

        private double GetHm(double xm)
        {
            return Math.Round((NOne / (2 * Math.PI * A * ROne)) * (0.5 * 1 * xm));
        }

        private double GetBm(double ym)
        {
            return (((R * C) / (NTwo * S)) * (0.5 * 0.005 * ym))/1000000;
        }

        private void FillRestOfLine(Text[] line)
        {
            double xm = double.Parse(Line[2].text);
            double H = GetHm(xm);
            line[8].text = H.ToString(CultureInfo.InvariantCulture);

            double ym = double.Parse(Line[3].text);
            line[9].text = GetBm(ym).ToString(CultureInfo.InvariantCulture);

            if (currentColor == 6)
            {
                var firstLine = matrix[0];
                firstLine[6].text = Math.Round((NOne*0.5*1*double.Parse(line[0].text))/(2*Math.PI*A*ROne)).ToString(CultureInfo.InvariantCulture);
                firstLine[7].text = (((R*(C/1000000))/(NTwo*S))* 0.5 * 0.005 * ym).ToString(CultureInfo.InvariantCulture);
            }
        }

        public void Clean()
        {
            foreach (Text[] t in matrix)
            {
                for (int i = 0; i < t.Length; i++)
                {
                    if (i == 4 || i == 5)
                    {
                        continue;
                    }
                    t[i].text = "_";
                }
            }
        }
    }
}
