using Assets.Scripts.EventSystem;
using UnityEngine;

public class LatrPointerChanger : MonoBehaviour
{
    // Use this for initialization
    void Start()
    {
        EventManager.AmpChanger += SetLatrPointer;
    }

    //поворот стрелки латра
    private void SetLatrPointer(float color)
    {
        transform.localEulerAngles = new Vector3(0, 0, CalculateValue(color));
    }

    // Update is called once per frame
    void Update()
    {

    }

    float CalculateValue(float angle)
    {
        switch ((int)angle)
        {
            case 0: return 0;
            case 1: return 10;
            case 2: return 15;
            case 3: return 25;
            case 4: return 30;
            case 5: return 35;
            case 6: return 40;
            default: return 0;
        }
    }
}
