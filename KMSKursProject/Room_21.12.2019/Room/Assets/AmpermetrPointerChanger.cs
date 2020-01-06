using Assets.Scripts.EventSystem;
using UnityEngine;

public class AmpermetrPointerChanger : MonoBehaviour
{
    // Use this for initialization
    void Start()
    {
        EventManager.AmpChanger += SetAmpPointer;
    }

    //поворот стрелки амперметра
    private void SetAmpPointer(float color)
    {
        transform.localEulerAngles = new Vector3(0, CalculateColor(color), 0);
    }

    // Update is called once per frame
    void Update()
    {

    }

    float CalculateColor(float angle)
    {
        switch ((int)angle)
        {
            case 0: return 0;
            case 1: return 1;
            case 2: return 5;
            case 3: return 10;
            case 4: return 25;
            case 5: return 40;
            case 6: return 50;
            default: return 0;
        }
    }
}
