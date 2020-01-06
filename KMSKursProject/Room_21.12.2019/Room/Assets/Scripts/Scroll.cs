using System.Collections;
using System.Collections.Generic;
using Assets.Scripts.EventSystem;
using UnityEngine;
using UnityEngine.EventSystems;

public class Scroll : MonoBehaviour
{
    [SerializeField]
    float scrollSpeed = 10f;
    [SerializeField]
    int sensivity = 3;

    int maxdistance = 40;
    int mindistance = 20;

    private int minTill = -30;
    private int maxTill = 30;

    float stvolspeed = 1f;
    float min = -30f;
    float max = 30f;

    private float rotationX = 0f;

    [SerializeField]
    Transform targetPos;

    private void OnEnable()
    {
        EventManager.ScrollValuesSeted += SetScrollValues;
        EventManager.SwitchTarget += SetTargetPos;
    }

    void FixedUpdate()
    {
        if (Input.GetAxis("Mouse ScrollWheel") != 0)
        {
            Vector3 newpos = transform.position + transform.TransformDirection(Vector3.forward * Input.GetAxis("Mouse ScrollWheel") * scrollSpeed);
            if (ControlDistance(Vector3.Distance(newpos, targetPos.position))) transform.position = newpos;
        }

        if (Input.GetMouseButton(1))
        {
            transform.RotateAround(targetPos.position, Vector3.up, Input.GetAxis("Mouse X")*sensivity);
            float y = Input.GetAxis("Mouse Y");
            if (y != 0)
            {
                SetRotation(y);
            }
        }
    }

    public void SetRotation(float amount)
    {
        float clampedAngle = Mathf.Clamp(CheckAngle(transform.eulerAngles.x - amount), -15, 30);
        transform.eulerAngles = new Vector3(clampedAngle, transform.eulerAngles.y, transform.eulerAngles.z);
    }

    public float CheckAngle(float value)
    {
        float angle = value - 180;

        if (angle > 0)
            return angle - 180;

        return angle + 180;
    }

    bool ControlDistance (float distance)
    {
        if (distance > mindistance && distance < maxdistance) return true;
        return false;
    }

    public void SetTargetPos(Transform target)
    {
        targetPos = target;
    }

    public void SetScrollValues(int objectIndex)
    {
        switch (objectIndex)
        {
            case 1:
            {
                maxdistance = 40;
                mindistance = 4;
                break;
            }
            case 2:
            {
                maxdistance = 40;
                mindistance = 8;
                break;
            }
            case 3:
            {
                maxdistance = 40;
                mindistance = 5;
                break;
            }
            case 4:
            {
                maxdistance = 40;
                mindistance = 3;
                break;
            }
            case 5:
            {
                maxdistance = 40;
                mindistance = 4;
                break;
            }
            case 6:
            {
                maxdistance = 40;
                mindistance = 5;
                break;
            }
        }
    }
    
}
