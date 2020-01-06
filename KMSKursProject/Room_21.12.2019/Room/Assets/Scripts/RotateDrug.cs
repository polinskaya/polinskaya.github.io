using Assets.Scripts.EventSystem;
using UnityEngine;

public class RotateDrug : MonoBehaviour
{
    public GameObject ScreenGameObject;

    private OscControll control;

    float sensivity = 100f;
    
    float minAngle = 0f;
    float maxAngle = 180;

    float previousAngle;

    private void Start()
    {
        control = ScreenGameObject.GetComponent<OscControll>();
    }

    //поворот ручки ЛАТР на градус
    private void OnMouseDrag()
    {
        float newz = Input.GetAxis("Mouse X") * sensivity + transform.eulerAngles.z;
        newz = Mathf.Clamp(newz, minAngle, maxAngle);
        if (newz == 0)
        {
            return;
        }

        CalculateAngle(newz);
    }

    //расчет градуса поворота
    void CalculateAngle(float angle)
    {
        angle = Mathf.Clamp(angle, minAngle, maxAngle);
        angle = (float)System.Math.Round(angle / 30) * 30;
        
        if (angle != previousAngle)
        {
            transform.localEulerAngles = new Vector3(0, angle, 0);
            previousAngle = angle;
        }

        EventManager.ChangeAmps(CalculateAmp(angle));
    }

    //получение значения по градусам
    float CalculateAmp(float angle)
    {
        switch ((int)angle)
        {
            case 0: return 0;
            case 30: return 1;
            case 60: return 2;
            case 90: return 3;
            case 120: return 4;
            case 150: return 5;
            case 180: return 6;
            default: return 0;
        }
    }
}
