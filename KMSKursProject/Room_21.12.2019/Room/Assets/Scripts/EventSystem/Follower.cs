using Assets.Scripts.EventSystem;
using UnityEngine;

public class Follower : MonoBehaviour {

    new Renderer renderer;

    private void Start()
    {
        renderer = GetComponent<Renderer>();
        renderer.enabled = false;
    }

    void OnEnable()//при включении/содании объекта
    {
        EventManager.Switch += SwithWork;//подписались на событие 
    }

    private void OnDisable()//при выключении/удалении объекта
    {
        EventManager.Switch -= SwithWork;//отписались от события
    }

    void SwithWork(bool work)//при возникновении события
    {
        if(work)
        {
            renderer.enabled = true;
        }
        else
        {
            renderer.enabled = false;
        }

    }


}
