using System;
using Assets.Scripts.EventSystem;
using UnityEngine;
using UnityEngine.UI;

public class OscControll : MonoBehaviour
{
    public GameObject OscScreen;
    public Text Label;

    public Texture OffTexture;
    public Texture OnTexture;
    public Texture OneTexture;
    public Texture TwoTexture;
    public Texture ThreeTexture;
    public Texture FourTexture;
    public Texture FiveTexture;
    public Texture SixTexture;

    private string onCaption = "Включить осцилограф";
    private string offCaption = "Выключить осцилограф";
    private string labelCaption = "Значение амперметра: {0}";

    private bool isOscOn = true;

    // Use this for initialization
    void Start()
    {
        EventManager.AmpChanger += SliderValueChanged;
        EventManager.Switch += OnOffOsc;
    }

    // Update is called once per frame
    void Update()
    {

    }

    //смена графика при включении осцилографа
    public void OnOffOsc(bool on)
    {
        if (on)
        {
            isOscOn = true;
            OscScreen.GetComponent<Renderer>().material.mainTexture = OnTexture;
        }
        else
        {
            isOscOn = false;
            OscScreen.GetComponent<Renderer>().material.mainTexture = OffTexture;
            Label.text = String.Format(labelCaption, 0);
            OscScreen.GetComponent<Renderer>().material.mainTexture = OffTexture;
        }
    }

    //смена графика на осцилографе
    public void SliderValueChanged(float value)
    {
        if (!isOscOn)
        {
            return;
        }

        if (value.Equals(0))
        {
            OscScreen.GetComponent<Renderer>().material.mainTexture = OnTexture;
            Label.text = String.Format(labelCaption, 0);
        }
        if (value.Equals(1))
        {
            OscScreen.GetComponent<Renderer>().material.mainTexture = OneTexture;
            Label.text = String.Format(labelCaption, 0.1);
        }
        if (value.Equals(2))
        {
            OscScreen.GetComponent<Renderer>().material.mainTexture = TwoTexture;
            Label.text = String.Format(labelCaption, 0.2);
        }
        if (value.Equals(3))
        {
            OscScreen.GetComponent<Renderer>().material.mainTexture = ThreeTexture;
            Label.text = String.Format(labelCaption, 0.3);
        }
        if (value.Equals(4))
        {
            OscScreen.GetComponent<Renderer>().material.mainTexture = FourTexture;
            Label.text = String.Format(labelCaption, 0.4);
        }
        if (value.Equals(5))
        {
            OscScreen.GetComponent<Renderer>().material.mainTexture = FiveTexture;
            Label.text = String.Format(labelCaption, 0.5);
        }
        if (value.Equals(6))
        {
            OscScreen.GetComponent<Renderer>().material.mainTexture = SixTexture;
            Label.text = String.Format(labelCaption, 0.6);
        }
    }
}
